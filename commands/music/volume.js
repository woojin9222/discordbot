const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume').setDescription('볼륨을 조절합니다.')
    .addIntegerOption((opt) => opt.setName('value').setDescription('볼륨 (0~100)').setRequired(true).setMinValue(0).setMaxValue(100)),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], ephemeral: true });
    const vol = interaction.options.getInteger('value');
    interaction.client.distube.setVolume(interaction.guild.id, vol);
    await interaction.reply({ embeds: [successEmbed(`볼륨을 **${vol}%**로 설정했습니다.`)] });
  },
};