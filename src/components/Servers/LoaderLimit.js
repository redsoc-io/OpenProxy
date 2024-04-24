import { CgSpinner } from "react-icons/cg";

export default function LoaderLimit() {
  return (
    <div className="py-3 text-center flex items-center justify-center w-full">
      <div className="w-full flex justify-center items-center py-6">
        <div className="animate-spin h-10 w-10 text-6xl flex items-center justify-center">
          <CgSpinner />
        </div>
      </div>
    </div>
  );
}
