const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('봇 응답 속도를 확인합니다.'),

  async execute(interaction) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;

    const color = latency < 100 ? 0x57f287 : latency < 300 ? 0xfee75c : 0xed4245;
    const emoji = latency < 100 ? '🟢' : latency < 300 ? '🟡' : '🔴';

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🏓 퐁!')
          .addFields(
            { name: `${emoji} 응답속도`, value: `${latency}ms`, inline: true },
            { name: '📡 API 레이턴시', value: `${apiPing}ms`, inline: true },
          )
          .setColor(color)
          .setTimestamp(),
      ],
    });
  },
};
