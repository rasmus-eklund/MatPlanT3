import { authorize, type User } from "~/server/auth";

export type WithAuthProps = { user: User };

export function WithAuth<P extends WithAuthProps>(
  WrappedComponent: React.ComponentType<P>,
  admin: boolean,
  getReturnTo?: (
    props: Omit<P, keyof WithAuthProps>,
  ) => Promise<string | undefined>,
) {
  return async function AuthenticatedComponent(props: Omit<P, keyof WithAuthProps>) {
    const returnTo = getReturnTo ? await getReturnTo(props) : undefined;
    const user = await authorize(admin, returnTo);
    return <WrappedComponent {...(props as P)} user={user} />;
  };
}
