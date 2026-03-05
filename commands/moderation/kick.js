const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('멤버를 서버에서 킥합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('킥할 멤버').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? '사유 없음';

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], flags: ['Ephemeral'] });
    if (!target.kickable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 킥할 수 없습니다.\n봇 역할이 대상보다 높은지 확인해주세요.')], flags: ['Ephemeral'] });
    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [errorEmbed('자기 자신을 킥할 수 없습니다.')], flags: ['Ephemeral'] });

    await target.kick(reason);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('👢 멤버 킥')
          .addFields(
            { name: '대상', value: `${target.user.tag} (${target.user.id})`, inline: true },
            { name: '사유', value: reason, inline: false },
          )
          .setColor(0xed4245)
          .setTimestamp(),
      ],
    });
  },
};
