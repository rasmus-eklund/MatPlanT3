type Props = { params: { id: string } };
const page = ({ params: { id } }: Props) => {
  return <div>edit recipe id: {id}</div>;
};

export default page;