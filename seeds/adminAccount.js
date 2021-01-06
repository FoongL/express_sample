exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('account')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('account').insert([
        {
          f_name: 'operations',
          l_name: 'team',
          pin: '$2b$10$W5XEcBqvUW85j93D3nnts.gXank0GizcDKNYy2boK9LWoUku3i/M6',
          is_admin: true
        },
      ]);
    });
};
