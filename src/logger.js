/**
 * src/logger.js
 * 서버 이벤트를 로그 채널에 기록합니다.
 *
 * 기록 항목:
 *   - 멤버 입장 (초대코드 + 초대자 추적)
 *   - 멤버 퇴장 / 킥
 *   - 메시지 삭제 / 수정
 *   - 밴 / 언밴
 *   - 뮤트 (타임아웃)
 */

const { EmbedBuilder, AuditLogEvent } = require('discord.js');

// 서버별 초대코드 사용 횟수 캐시 { guildId => Map<code, uses> }
const inviteCache = new Map();

function getLogChannel(client, guildId) {
  const channelId = client.logChannels?.get(guildId);
  if (!channelId) return null;
  return client.channels.cache.get(channelId) ?? null;
}

// 초대 목록을 캐시에 저장
async function cacheInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    inviteCache.set(guild.id, new Map(invites.map((inv) => [inv.code, inv.uses])));
  } catch {}
}

function setupLogger(client) {

  // ── 봇 준비 시 모든 서버 초대 캐싱 ──────────────────────
  client.on('guildCreate', (guild) => cacheInvites(guild));

  // 봇이 이미 서버에 있는 경우 clientReady 이후 캐싱
  // (client.js의 clientReady에서 setupLogger 호출 후이므로 guilds.cache 사용 가능)
  setTimeout(() => {
    client.guilds.cache.forEach((guild) => cacheInvites(guild));
  }, 2000);

  // ── 멤버 입장 ────────────────────────────────────────────
  client.on('guildMemberAdd', async (member) => {
    const ch = getLogChannel(client, member.guild.id);

    // 초대코드 추적
    let inviteInfo = '알 수 없음';
    try {
      const oldCache  = inviteCache.get(member.guild.id) ?? new Map();
      const newInvites = await member.guild.invites.fetch();

      // 사용 횟수가 늘어난 초대코드 찾기
      const usedInvite = newInvites.find((inv) => {
        const prev = oldCache.get(inv.code) ?? 0;
        return inv.uses > prev;
      });

      if (usedInvite) {
        const inviter = usedInvite.inviter;
        inviteInfo = `\`${usedInvite.code}\` (초대자: ${inviter?.tag ?? '알 수 없음'}, 사용횟수: ${usedInvite.uses}회)`;
      }

      // 캐시 업데이트
      inviteCache.set(member.guild.id, new Map(newInvites.map((inv) => [inv.code, inv.uses])));
    } catch {}

    if (!ch) return;

    const accountAge = Date.now() - member.user.createdTimestamp;
    const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000; // 7일 미만

    const embed = new EmbedBuilder()
      .setTitle('📥 멤버 입장')
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setDescription(`${member} (${member.user.tag})`)
      .addFields(
        { name: '유저 ID',    value: member.id,                                                      inline: true },
        { name: '계정 생성일', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,   inline: true },
        { name: '초대 코드',  value: inviteInfo,                                                     inline: false },
      )
      .setColor(isNewAccount ? 0xfee75c : 0x57f287) // 신규 계정은 노란색 경고
      .setFooter({ text: isNewAccount ? '⚠️ 7일 미만 신규 계정' : `현재 멤버: ${member.guild.memberCount}명` })
      .setTimestamp();

    ch.send({ embeds: [embed] });
  });

  // ── 멤버 퇴장 / 킥 ───────────────────────────────────────
  client.on('guildMemberRemove', async (member) => {
    const ch = getLogChannel(client, member.guild.id);
    if (!ch) return;

    let title = '📤 멤버 퇴장';
    let executor = null;
    let color = 0xfee75c;

    try {
      const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === member.id && Date.now() - entry.createdTimestamp < 5000) {
        title    = '👢 멤버 킥';
        executor = entry.executor?.tag ?? '알 수 없음';
        color    = 0xed4245;
      }
    } catch {}

    const fields = [{ name: '유저 ID', value: member.id, inline: true }];
    if (executor) fields.push({ name: '집행자', value: executor, inline: true });

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setThumbnail(member.user.displayAvatarURL())
          .setDescription(`${member.user.tag}`)
          .addFields(...fields)
          .setColor(color)
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
          .setDescription(`${message.channel} 에서 메시지 삭제됨`)
          .addFields(
            { name: '작성자', value: `${message.author?.tag ?? '알 수 없음'} (${message.author?.id ?? '?'})`, inline: true },
            { name: '내용',   value: message.content?.slice(0, 1024) || '(내용 없음 / 캐시 없음)' },
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
          .setDescription(`${newMsg.channel} · [메시지 이동](${newMsg.url})`)
          .addFields(
            { name: '작성자',  value: `${newMsg.author?.tag ?? '알 수 없음'}`, inline: true },
            { name: '수정 전', value: oldMsg.content?.slice(0, 512) || '(캐시 없음)' },
            { name: '수정 후', value: newMsg.content?.slice(0, 512) || '(내용 없음)' },
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
      const logs  = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBan, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === ban.user.id) executor = entry.executor?.tag ?? '알 수 없음';
    } catch {}

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔨 멤버 밴')
          .setThumbnail(ban.user.displayAvatarURL())
          .addFields(
            { name: '대상',   value: `${ban.user.tag} (${ban.user.id})`, inline: true },
            { name: '집행자', value: executor,                            inline: true },
            { name: '사유',   value: ban.reason ?? '사유 없음' },
          )
          .setColor(0xed4245)
          .setTimestamp(),
      ],
    });
  });

  // ── 언밴 ─────────────────────────────────────────────────
  client.on('guildBanRemove', async (ban) => {
    const ch = getLogChannel(client, ban.guild.id);
    if (!ch) return;

    let executor = '알 수 없음';
    try {
      const logs  = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
      const entry = logs.entries.first();
      if (entry && entry.target?.id === ban.user.id) executor = entry.executor?.tag ?? '알 수 없음';
    } catch {}

    ch.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔓 멤버 언밴')
          .addFields(
            { name: '대상',   value: `${ban.user.tag} (${ban.user.id})`, inline: true },
            { name: '집행자', value: executor,                            inline: true },
          )
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  });

  // ── 타임아웃 ─────────────────────────────────────────────
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const ch = getLogChannel(client, newMember.guild.id);
    if (!ch) return;

    const wasTimedOut = oldMember.communicationDisabledUntil;
    const isTimedOut  = newMember.communicationDisabledUntil;

    // 타임아웃 적용
    if (!wasTimedOut && isTimedOut) {
      let executor = '알 수 없음';
      try {
        const logs  = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
        const entry = logs.entries.first();
        if (entry && entry.target?.id === newMember.id) executor = entry.executor?.tag ?? '알 수 없음';
      } catch {}

      ch.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔇 타임아웃 적용')
            .addFields(
              { name: '대상',     value: `${newMember} (${newMember.user.tag})`,                          inline: true },
              { name: '집행자',   value: executor,                                                          inline: true },
              { name: '해제 시각', value: `<t:${Math.floor(isTimedOut.getTime() / 1000)}:R>`,             inline: false },
            )
            .setColor(0xfee75c)
            .setTimestamp(),
        ],
      });

    // 타임아웃 해제
    } else if (wasTimedOut && !isTimedOut) {
      ch.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('🔊 타임아웃 해제')
            .addFields({ name: '대상', value: `${newMember} (${newMember.user.tag})`, inline: true })
            .setColor(0x57f287)
            .setTimestamp(),
        ],
      });
    }
  });

  console.log('📋 로그 시스템 활성화');
}

module.exports = { setupLogger };