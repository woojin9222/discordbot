/**
 * src/logger.js
 * 서버 이벤트를 로그 채널에 기록합니다.
 *
 * 기록 항목:
 *   - 멤버 입장 / 퇴장
 *   - 메시지 삭제
 *   - 메시지 수정
 *   - 멤버 밴 / 언밴
 *   - 멤버 킥 (auditLog)
 */

const { EmbedBuilder, AuditLogEvent } = require('discord.js');

// 로그 채널 가져오기 헬퍼
function getLogChannel(client, guildId) {
  const channelId = client.logChannels?.get(guildId);
  if (!channelId) return null;
  return client.channels.cache.get(channelId) ?? null;
}

function setupLogger(client) {

  // ── 멤버 입장 ────────────────────────────────────────────
  client.on('guildMemberAdd', (member) => {
    const ch = getLogChannel(client, member.guild.id);
    if (!ch) return;
    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('📥 멤버 입장')
          .setThumbnail(member.user.displayAvatarURL())
          .setDescription(`${member} (${member.user.tag})`)
          .addFields(
            { name: '계정 생성일', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '유저 ID',    value: member.id, inline: true },
          )
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  });

  // ── 멤버 퇴장 ────────────────────────────────────────────
  client.on('guildMemberRemove', async (member) => {
    const ch = getLogChannel(client, member.guild.id);
    if (!ch) return;

    // 킥 여부 확인 (AuditLog)
    let action = '퇴장';
    try {
      const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === member.id && Date.now() - entry.createdTimestamp < 5000) {
        action = `킥 (집행자: ${entry.executor?.tag ?? '알 수 없음'})`;
      }
    } catch {}

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`📤 멤버 ${action}`)
          .setThumbnail(member.user.displayAvatarURL())
          .setDescription(`${member.user.tag}`)
          .addFields({ name: '유저 ID', value: member.id, inline: true })
          .setColor(action === '퇴장' ? 0xfee75c : 0xed4245)
          .setTimestamp(),
      ],
    });
  });

  // ── 메시지 삭제 ──────────────────────────────────────────
  client.on('messageDelete', (message) => {
    if (!message.guild || message.author?.bot) return;
    const ch = getLogChannel(client, message.guild.id);
    if (!ch) return;

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🗑️ 메시지 삭제')
          .setDescription(`${message.channel} 에서 메시지가 삭제됐습니다.`)
          .addFields(
            { name: '작성자',  value: `${message.author?.tag ?? '알 수 없음'} (${message.author?.id ?? '?'})`, inline: true },
            { name: '내용',    value: message.content?.slice(0, 1024) || '(내용 없음 / 캐시 없음)' },
          )
          .setColor(0xed4245)
          .setTimestamp(),
      ],
    });
  });

  // ── 메시지 수정 ──────────────────────────────────────────
  client.on('messageUpdate', (oldMsg, newMsg) => {
    if (!newMsg.guild || newMsg.author?.bot) return;
    if (oldMsg.content === newMsg.content) return;
    const ch = getLogChannel(client, newMsg.guild.id);
    if (!ch) return;

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('✏️ 메시지 수정')
          .setDescription(`${newMsg.channel} 에서 메시지가 수정됐습니다. [이동](${newMsg.url})`)
          .addFields(
            { name: '작성자',    value: `${newMsg.author?.tag ?? '알 수 없음'}`, inline: true },
            { name: '수정 전',   value: oldMsg.content?.slice(0, 512) || '(캐시 없음)' },
            { name: '수정 후',   value: newMsg.content?.slice(0, 512) || '(내용 없음)' },
          )
          .setColor(0xfee75c)
          .setTimestamp(),
      ],
    });
  });

  // ── 밴 ───────────────────────────────────────────────────
  client.on('guildBanAdd', async (ban) => {
    const ch = getLogChannel(client, ban.guild.id);
    if (!ch) return;

    let executor = '알 수 없음';
    try {
      const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBan, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === ban.user.id) executor = entry.executor?.tag ?? '알 수 없음';
    } catch {}

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔨 멤버 밴')
          .setThumbnail(ban.user.displayAvatarURL())
          .addFields(
            { name: '대상',    value: `${ban.user.tag} (${ban.user.id})`, inline: true },
            { name: '집행자',  value: executor,                            inline: true },
            { name: '사유',    value: ban.reason ?? '사유 없음' },
          )
          .setColor(0xed4245)
          .setTimestamp(),
      ],
    });
  });

  // ── 언밴 ─────────────────────────────────────────────────
  client.on('guildBanRemove', (ban) => {
    const ch = getLogChannel(client, ban.guild.id);
    if (!ch) return;

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔓 멤버 언밴')
          .addFields({ name: '대상', value: `${ban.user.tag} (${ban.user.id})` })
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  });

  console.log('📋 로그 시스템 활성화');
}

module.exports = { setupLogger };
