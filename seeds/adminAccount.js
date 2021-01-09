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
          is_admin: true,
        },
        {
          f_name: 'test_user',
          l_name:'one',
          pin: '$2b$10$Ln.yj8znOYFh1.48UzWNj.clvSgD0AlTeimGYSIozv9ytsEuAxoBq',
          balance: 100
        },
        {
          f_name: 'test_user',
          l_name:'two',
          pin: '$2b$10$9IabQBQTicLhrlB33k..wOSHaO6nrbMmWMQZUzKH4mwlRKPTAc1he',
          balance: 100
        }
      ]);
    });
};
