import { authorize, type User } from "~/server/auth";

export type WithAuthProps = { user: User };

export function WithAuth<P extends WithAuthProps>(
  WrappedComponent: React.ComponentType<P>,
  admin: boolean,
) {
  return async function AuthenticatedCOmponent(
    props: Omit<P, keyof WithAuthProps>,
  ) {
    const user = await authorize(admin);
    return <WrappedComponent {...(props as P)} user={user} />;
  };
}
