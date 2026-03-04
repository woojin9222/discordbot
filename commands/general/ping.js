const { SlashCommandBuilder } = require('discord.js');
const { embed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('봇 지연시간을 확인합니다.'),

  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;
    await interaction.reply({
      embeds: [embed('🏓 퐁!', `레이턴시: **${latency}ms**\nAPI: **${interaction.client.ws.ping}ms**`)],
    });
  },
};
