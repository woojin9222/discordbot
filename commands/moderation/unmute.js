const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('멤버의 타임아웃을 해제합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('타임아웃 해제할 멤버').setRequired(true),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('target');

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], flags: ['Ephemeral'] });
    if (!target.isCommunicationDisabled())
      return interaction.reply({ embeds: [errorEmbed('해당 멤버는 현재 타임아웃 상태가 아닙니다.')], flags: ['Ephemeral'] });

    await target.timeout(null);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔊 타임아웃 해제')
          .addFields({ name: '대상', value: `${target} (${target.user.tag})`, inline: true })
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  },
};
