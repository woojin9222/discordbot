const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('밴된 유저를 언밴합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) =>
      opt.setName('userid').setDescription('언밴할 유저 ID').setRequired(true),
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');

    try {
      await interaction.guild.members.unban(userId);
      await interaction.reply({ embeds: [successEmbed(`유저 ID **${userId}**를 언밴했습니다.`)] });
    } catch {
      await interaction.reply({
        embeds: [errorEmbed('해당 유저를 찾을 수 없거나 밴되지 않은 유저입니다.')],
        ephemeral: true,
      });
    }
  },
};
