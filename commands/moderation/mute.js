const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('멤버를 1시간 타임아웃합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('타임아웃할 멤버').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') ?? '사유 없음';

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], ephemeral: true });

    await target.timeout(60 * 60 * 1000, reason);
    await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}**를 1시간 타임아웃했습니다.\n사유: ${reason}`)] });
  },
};
