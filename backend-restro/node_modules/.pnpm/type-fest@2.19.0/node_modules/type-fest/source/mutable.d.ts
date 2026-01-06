import type {Writable} from '.pnpm/type-fest@2.19.0/node_modules/type-fest/source/writable';

/** @deprecated @see Writable */
export type Mutable<BaseType, Keys extends keyof BaseType = keyof BaseType> =
	Writable<BaseType, Keys>;
