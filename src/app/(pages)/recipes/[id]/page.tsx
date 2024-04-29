type Props = { params: { id: string } };
const page = ({ params: { id } }: Props) => {
  return <div>recipe id: {id}</div>;
};

export default page;
