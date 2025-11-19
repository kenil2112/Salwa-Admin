import { Button } from "antd";

function PrimaryButton({ Children, ...props }: any) {
  return (
    <Button
      type="primary"
      className="bg-primary !h-11 text-base font-medium hover:!bg-primary"
      children={Children}
      {...props}
    />
  );
}

export default PrimaryButton;
