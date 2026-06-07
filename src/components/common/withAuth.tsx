import { authorize } from "~/server/auth";

export function WithAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  admin: boolean,
  getReturnTo?: (props: P) => Promise<string | undefined>,
): (props: P) => Promise<React.ReactElement>;

export function WithAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  admin: boolean,
  getReturnTo?: (props: P) => Promise<string | undefined>,
) {
  return async function AuthenticatedComponent(props: P) {
    const returnTo = getReturnTo ? await getReturnTo(props) : undefined;
    await authorize(admin, returnTo);
    return <WrappedComponent {...props} />;
  };
}
