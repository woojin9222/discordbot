const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('메시지를 일괄 삭제합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('삭제할 메시지 개수 (1~100)').setRequired(true).setMinValue(1).setMaxValue(100),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.editReply({
      embeds: [successEmbed(`**${deleted.size}**개의 메시지를 삭제했습니다.`)],
    });
  },
};
