const { EmbedBuilder } = require('discord.js');

/**
 * 인증 버튼 클릭 처리
 *
 * customId 형식: "verify_button:ROLE_ID:CHANNEL_ID_OR_none"
 * - ROLE_ID      : 부여할 역할 ID
 * - CHANNEL_ID   : 인증 후 접근 허용 채널 ID (없으면 "none")
 *
 * 설정값을 customId에 인코딩하므로 DB/파일/env 불필요
 */
async function handleVerifyButton(interaction) {
  await interaction.deferReply({ flags: ['Ephemeral'] });

  const { member, guild, customId } = interaction;

  // ── customId 파싱 ─────────────────────────────────────────
  // 형식: verify_button:ROLE_ID:CHANNEL_ID
  const parts = customId.split(':');
  const roleId    = parts[1];
  const channelId = parts[2] !== 'none' ? parts[2] : null;

  if (!roleId) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ 설정 오류')
          .setDescription('인증 패널 설정이 올바르지 않습니다. 관리자에게 문의해주세요.')
          .setColor(0xed4245),
      ],
    });
  }

  // ── 이미 인증된 멤버 체크 ─────────────────────────────────
  if (member.roles.cache.has(roleId)) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('ℹ️ 이미 인증됨')
          .setDescription('이미 인증이 완료된 상태입니다.')
          .setColor(0xfee75c),
      ],
    });
  }

  // ── 역할 존재 여부 확인 ───────────────────────────────────
  const role = guild.roles.cache.get(roleId);
  if (!role) {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ 역할 없음')
          .setDescription('설정된 인증 역할을 찾을 수 없습니다.\n관리자가 `/verify-setup`으로 패널을 다시 만들어주세요.')
          .setColor(0xed4245),
      ],
    });
  }

  // ── 역할 부여 ─────────────────────────────────────────────
  try {
    await member.roles.add(role, '버튼 인증 완료');
  } catch (err) {
    console.error('역할 부여 실패:', err);
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('❌ 역할 부여 실패')
          .setDescription(
            '역할을 부여하는 중 오류가 발생했습니다.\n' +
            '봇의 역할이 인증 역할보다 높은지 확인해주세요.',
          )
          .setColor(0xed4245),
      ],
    });
  }

  // ── 채널 접근 권한 부여 (선택) ────────────────────────────
  let channelMention = '';
  if (channelId) {
    const channel = guild.channels.cache.get(channelId);
    if (channel) {
      try {
        await channel.permissionOverwrites.edit(member, {
          ViewChannel: true,
          SendMessages: true,
        });
        channelMention = `\n📢 ${channel} 채널에 접근할 수 있습니다!`;
      } catch (err) {
        console.error('채널 권한 부여 실패:', err);
        channelMention = '\n⚠️ 채널 권한 설정 중 오류가 발생했지만 역할은 정상 부여됐습니다.';
      }
    }
  }

  // ── 성공 응답 ─────────────────────────────────────────────
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle('✅ 인증 완료!')
        .setDescription(
          `**${member.displayName}**님, 인증이 완료됐습니다!\n` +
          `🎭 **${role.name}** 역할이 부여됐습니다.${channelMention}`,
        )
        .setColor(0x57f287)
        .setTimestamp(),
    ],
  });

  console.log(`✅ 인증 완료: ${member.user.tag} (${guild.name}) → 역할: ${role.name}`);
}

module.exports = { handleVerifyButton };
