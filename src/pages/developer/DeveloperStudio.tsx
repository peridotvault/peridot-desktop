// @ts-ignore
import React, { useEffect, useState } from "react";
import { AppInterface } from "../../interfaces/app/AppInterface";
import {
  deleteApp,
  getAppByDeveloperId,
} from "../../blockchain/icp/app/services/ICPAppService";
import { useWallet } from "../../contexts/WalletContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Alert } from "../../components/molecules/Alert";

export const DeveloperStudio = () => {
  const { wallet } = useWallet();
  const [apps, setApps] = useState<AppInterface[] | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return; // jaga2 kalau wallet belum siap
        const listApp = await getAppByDeveloperId({ wallet });
        if (isMounted) setApps(listApp);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  async function handleDelete(appId: number) {
    try {
      const resultMsg = await deleteApp({ wallet, appId });
      // kalau API balikin string atau status, bisa dicek disini
      setAlert({ type: "success", message: "App berhasil dihapus!" });

      // update list setelah delete
      setApps((prev) => prev?.filter((a) => Number(a.appId) !== appId) ?? null);
      console.log(resultMsg);
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Gagal menghapus app." });
    }
  }

  return (
    <div className="py-8 flex flex-col">
      {apps?.map((item, index) => (
        <Link
          className="border-b border-text_disabled/25 px-8 py-4 hover:bg-background_secondary flex gap-6 items-center justify-between"
          key={index}
          to={"/studio/update/" + item.appId.toString()}
        >
          <div className="flex gap-6 items-start">
            <div className="w-12 aspect-[3/4]">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="">
              <p className="">{item.title}</p>
              <p className="text-sm text-text_disabled">{item.description}</p>
            </div>
          </div>
          <div
            className="w-1/4 h-full cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => handleDelete(Number(item.appId))}>
              <FontAwesomeIcon icon={faTrash} className="text-danger" />
            </button>
          </div>
        </Link>
      ))}

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};
