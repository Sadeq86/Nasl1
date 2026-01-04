const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

const CONFIG = {
  LOG_CHANNEL: '1446896003574661250',
  CATEGORIES: {
    nasl1: { open: '1409485955169124412', close: '1412057255079313450', role: '1411083330773848194', label: 'Nasl 1' },
    staff: { open: '1409487313699864629', close: '1412057196283428936', role: '1223605183540494448', label: 'Staff Team' },
    others: { open: '1409487668714410015', close: '1412057410054524939', role: '1410028298800730112', label: 'Others' }
  }
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton()) {
      const { customId, guild, user } = interaction;
      
      if (customId.startsWith('ticket_')) {
        const type = customId.split('_')[1];
        if (CONFIG.CATEGORIES[type]) {
          const cfg = CONFIG.CATEGORIES[type];
          await interaction.deferReply({ ephemeral: true });

          const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: cfg.open,
            permissionOverwrites: [
              { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
              { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
              { id: cfg.role, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
          });

          const embed = new EmbedBuilder()
            .setTitle(`Welcome ${user.username}`)
            .setDescription(`Please wait until a staff claims the ticket.\n\n**Category:** ${cfg.label}`)
            .setColor('Blue')
            .setFooter({ text: 'Nasl-1 Ticket System' });

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ticket_claim_${type}`).setLabel('Claim').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`ticket_close_${type}`).setLabel('Close').setStyle(ButtonStyle.Danger)
          );

          await channel.send({ content: `<@&${cfg.role}> <@${user.id}>`, embeds: [embed], components: [row] });
          await interaction.editReply(`Ticket created: ${channel}`);
          return;
        }
      }

      if (customId.startsWith('ticket_claim_')) {
        const type = customId.split('_')[2];
        await interaction.message.edit({ components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(customId).setLabel('Claimed').setStyle(ButtonStyle.Success).setDisabled(true),
            new ButtonBuilder().setCustomId(`ticket_close_${type}`).setLabel('Close').setStyle(ButtonStyle.Danger)
          )
        ]});
        await interaction.reply({ content: `Ticket claimed by ${user}` });
        return;
      }

      if (customId.startsWith('ticket_close_')) {
        const type = customId.split('_')[2];
        const cfg = CONFIG.CATEGORIES[type];
        await interaction.channel.setParent(cfg.close);
        
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`ticket_delete_${user.id}`).setLabel('Delete').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`ticket_transcript_${user.id}`).setLabel('Transcript').setStyle(ButtonStyle.Secondary)
        );
        
        await interaction.reply({ content: 'Ticket closed. Use buttons below to manage.', components: [row] });
        return;
      }

      if (customId.startsWith('ticket_delete')) {
        await interaction.reply('Deleting ticket in 5 seconds...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
      }

      if (customId.startsWith('ticket_transcript_')) {
        const openerId = customId.split('_')[2];
        const messages = await interaction.channel.messages.fetch();
        const content = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');
        const filename = `transcript-${interaction.channel.name}.txt`;
        fs.writeFileSync(filename, content);
        const attachment = new AttachmentBuilder(filename);

        const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL);
        await logChannel.send({ content: `Transcript for ${interaction.channel.name}`, files: [attachment] });
        
        const opener = await guild.members.fetch(openerId).catch(() => null);
        if (opener) await opener.send({ content: `Transcript for your ticket ${interaction.channel.name}`, files: [attachment] }).catch(() => {});
        
        await interaction.reply({ content: 'Transcript sent to log channel and user DM!', ephemeral: true });
        fs.unlinkSync(filename);
      }
    }
  }
};