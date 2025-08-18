import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions,
} from '@convex-dev/better-auth';
import { api, components, internal } from './_generated/api';
import type { DataModel, Id } from './_generated/dataModel';

const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (ctx, user) => {
    return ctx.db.insert('users', {
      email: user.email,
      currency: 'INR',
      displayName: user.name,
    });
  },

  onDeleteUser: async (ctx, userId) => {
    await ctx.db.delete(userId as Id<'users'>);
  },
});
