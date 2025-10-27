export const idlFactory = ({ IDL }: { IDL: any }) => {
  const init = IDL.Record({
    'initMetadataURI': IDL.Text,
    'initName': IDL.Text,
    'initMaxSupply': IDL.Nat64,
    'initGameId': IDL.Text,
    'initDescription': IDL.Text,
    'initTokenCanister': IDL.Principal,
    'initPrice': IDL.Nat64,
  });
  const Controllers = IDL.Record({ 'registry': IDL.Opt(IDL.Principal) });
  const PeridotFactory = IDL.Service({
    'createAndRegisterPGC1Paid': IDL.Func(
      [
        IDL.Record({
          'controllers_extra': IDL.Opt(IDL.Vec(IDL.Principal)),
          'meta': init,
        }),
      ],
      [
        IDL.Record({
          'canister_id': IDL.Principal,
          'error': IDL.Opt(IDL.Text),
          'registered': IDL.Bool,
        }),
      ],
      [],
    ),
    'createAndRegisterPGC1WithVoucher': IDL.Func(
      [
        IDL.Record({
          'controllers_extra': IDL.Opt(IDL.Vec(IDL.Principal)),
          'meta': init,
          'voucher_code': IDL.Text,
        }),
      ],
      [
        IDL.Record({
          'canister_id': IDL.Principal,
          'error': IDL.Opt(IDL.Text),
          'registered': IDL.Bool,
        }),
      ],
      [],
    ),
    'get_controllers': IDL.Func([], [Controllers], ['query']),
    'get_created_pgc1s': IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, init))],
      ['query'],
    ),
    'get_default_cycles': IDL.Func([], [IDL.Nat], ['query']),
    'get_pgc1_count': IDL.Func([], [IDL.Nat], ['query']),
    'get_pgc1_info': IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          'owner': IDL.Principal,
          'name': IDL.Text,
          'game_id': IDL.Text,
        }),
      ],
      [],
    ),
    'list_my_pgc1_min': IDL.Func(
      [IDL.Opt(IDL.Bool)],
      [
        IDL.Vec(
          IDL.Record({
            'name': IDL.Text,
            'canister_id': IDL.Principal,
            'game_id': IDL.Text,
            'registered': IDL.Bool,
          })
        ),
      ],
      [],
    ),
    'set_controllers': IDL.Func([Controllers], [IDL.Bool], []),
    'set_default_cycles': IDL.Func([IDL.Nat], [IDL.Bool], []),
  });
  return PeridotFactory;
};
export const init = ({ IDL }: { IDL: any }) => { return [IDL.Opt(IDL.Principal)]; };
