const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

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
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], ephemeral: true });

    await target.timeout(null);
    await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}**의 타임아웃을 해제했습니다.`)] });
  },
};
