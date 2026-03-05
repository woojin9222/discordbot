const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('np').setDescription('현재 재생 중인 곡을 표시합니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue?.songs?.[0]) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], flags: ['Ephemeral'] });
    const song = queue.songs[0];
    await interaction.reply({
      embeds: [embed('🎶 현재 재생 중', `**[${song.name}](${song.url})**\n요청자: ${song.user?.tag ?? '알 수 없음'}　⏱ ${song.formattedDuration}`, 0x1db954)],
    });
  },
};
