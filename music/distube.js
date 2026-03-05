const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { EmbedBuilder } = require('discord.js');

function createDistube(client) {
  const distube = new DisTube(client, {
    plugins: [
      new SpotifyPlugin(),
      new YtDlpPlugin({
        update: false,                // ★ 매번 yt-dlp 업데이트 체크 안 함 (속도 개선 핵심)
      }),
    ],
  });

  // ── 재생 시작 ──────────────────────────────────────────────
  distube.on('playSong', (queue, song) => {
    const source = song.plugin === 'spotify' ? '🟢 Spotify' : '🔴 YouTube';
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎶 재생 중')
          .setDescription(
            `**[${song.name}](${song.url})**\n` +
            `요청자: ${song.user?.tag ?? '알 수 없음'}　${source}　⏱ ${song.formattedDuration}`,
          )
          .setThumbnail(song.thumbnail)
          .setColor(0x1db954),
      ],
    });
  });

  // ── 대기열 추가 ────────────────────────────────────────────
  distube.on('addSong', (queue, song) => {
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('📋 대기열 추가')
          .setDescription(
            `**[${song.name}](${song.url})**\n` +
            `대기열 위치: **${queue.songs.length}번째**　⏱ ${song.formattedDuration}`,
          )
          .setColor(0x5865f2),
      ],
    });
  });

  // ── 플레이리스트 추가 ──────────────────────────────────────
  distube.on('addList', (queue, playlist) => {
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('📋 플레이리스트 추가')
          .setDescription(`**${playlist.name}** — ${playlist.songs.length}곡 추가됨`)
          .setColor(0x5865f2),
      ],
    });
  });

  // ── 재생 종료 ──────────────────────────────────────────────
  distube.on('finish', (queue) => {
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎵 재생 종료')
          .setDescription('재생목록이 모두 끝났습니다.')
          .setColor(0x5865f2),
      ],
    });
  });

  // ── 에러 처리 ──────────────────────────────────────────────
  distube.on('error', (error, queue) => {
    console.error('DisTube error:', error);
    queue?.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ 재생 오류')
          .setDescription(`\`${error.message}\``)
          .setColor(0xed4245),
      ],
    });
  });

  distube.on('empty', (queue) => {
    queue.textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('👋 채널 비어있음')
          .setDescription('음성 채널에 아무도 없어서 나갔습니다.')
          .setColor(0xfee75c),
      ],
    });
  });

  return distube;
}

module.exports = { createDistube };
