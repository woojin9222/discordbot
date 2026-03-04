const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

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
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], ephemeral: true });
    if (!target.kickable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 킥할 수 없습니다.')], ephemeral: true });

    await target.kick(reason);
    await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}**를 킥했습니다.\n사유: ${reason}`)] });
  },
};
