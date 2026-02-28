import { authorize, type User } from "~/server/auth";

export type WithAuthProps = { user: User };

type RouteProps = {
  params?: Promise<{ id?: string }>;
};

export function WithAuth<P extends WithAuthProps>(
  WrappedComponent: React.ComponentType<P>,
  admin: boolean,
  getReturnTo?: (props: any) => Promise<string | undefined>,
) {
  return async function AuthenticatedComponent(
    props: Omit<P, keyof WithAuthProps> & RouteProps,
  ) {
    const returnTo = getReturnTo ? await getReturnTo(props) : undefined;
    const user = await authorize(admin, returnTo);
    return <WrappedComponent {...(props as P)} user={user} />;
  };
}
