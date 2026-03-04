const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('음악을 재생합니다. YouTube/Spotify URL 또는 검색어를 입력하세요.')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('YouTube URL · Spotify URL · 검색어').setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.editReply({ embeds: [errorEmbed('먼저 음성 채널에 입장해주세요.')] });

    const perms = voiceChannel.permissionsFor(interaction.client.user);
    if (!perms.has(PermissionFlagsBits.Connect) || !perms.has(PermissionFlagsBits.Speak))
      return interaction.editReply({ embeds: [errorEmbed('음성 채널 접속/발언 권한이 없습니다.')] });

    const query = interaction.options.getString('query');

    try {
      await interaction.client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction,
      });
      // playSong / addSong 이벤트에서 응답하므로 여기선 defer 처리만
      await interaction.editReply({ content: '🔍 검색 중...' });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [errorEmbed(`오류: \`${err.message}\``)] });
    }
  },
};