// PocketBase JS Hook — проверка прав для создания приглашений
// Положить в: pb_hooks/invitations.pb.js (рядом с PocketBase executable)

onRecordBeforeCreateRequest((e) => {
  const userId = e.httpContext.get('authRecord').id;
  const serverId = e.record.get('server_id');

  if (!serverId) return;

  // Владелец сервера может всё
  const server = $app.dao().findRecordById('servers', serverId);
  if (server?.get('owner_id') === userId) return;

  // Проверяем роли
  const assignments = $app.dao().findRecordsByFilter(
    'server_role_assignments',
    `server_id = "${serverId}" && user_id = "${userId}"`,
    '', 0, 0, { expand: 'role_id' }
  );

  for (const a of assignments) {
    const role = a.expand?.role_id;
    if (!role) continue;
    const perms = role.get('permissions') || [];
    if (perms.includes('manage_invites')) return;
  }

  throw new ForbiddenError('Недостаточно правъ для созданiя приглашенiя');
});
