import { match } from '../index';

describe("(match) Check 2 strings", () => {

	test("[case insensitive] Check if they are the same string", () =>
    expect(
      match('lorem ipsum', 'Lorem Ipsum')
    ).toBeTruthy()
	);

	test("[case sensitive] Check if they are the same string", () =>
		expect(
			match('lorem ipsum', 'Lorem Ipsum', true)
		).toBeFalsy()
	);

  test("[distance -1, case insensitive] 1-way check if 1° parameter is substring contained in the 2°", () =>
    expect(
      match('Ipsum', 'lorem ipsum sit dolor')
    ).toBeTruthy()
  );

  test("[distance -1, case sensitive] 1-way check if 1° parameter is substring contained in the 2°", () =>
    expect(
      match('Ipsum', 'lorem ipsum sit dolor', true)
    ).toBeFalsy()
  );

  test("[distance -2] 2-way Check substring contained in a string", () =>
    expect(
      match('Ipsum', 'lorem ipsum sit dolor', false, -2) &&
      match('lorem ipsum sit dolor', 'Ipsum', false, -2)
    ).toBeTruthy()
  );

  test("[distance 2, case insensitive] Check if they are similar (Levenshtein Distance)", () =>
    expect(
      match('lorem ipsum', 'lorem ispum', false, 2)
    ).toBeTruthy()
  );

  test("[distance 4, case sensitive] Check if they are similar (sensitive count as distance)", () =>
    expect(
      match('lorem ipsum', 'Lorem Ispum', true, 4)
    ).toBeTruthy()
  )
});
