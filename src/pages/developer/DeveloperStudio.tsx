import React, { useEffect, useState } from "react";
import { AppInterface } from "../../interfaces/app/AppInterface";
import { getAppByDeveloperId } from "../../blockchain/icp/app/services/ICPAppService";
import { useWallet } from "../../contexts/WalletContext";
import { Link } from "react-router-dom";

export const DeveloperStudio = () => {
  const { wallet } = useWallet();
  const [apps, setApps] = useState<AppInterface[] | null>(null);

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

  return (
    <div className="p-8 flex">
      {apps?.map((item, index) => (
        <Link
          className="border p-4"
          key={index}
          to={"/studio/update/" + item.appId.toString()}
        >
          <p className="">{item.appId.toString()}</p>
          <p className="">{item.title}</p>
          <p className="">{item.description}</p>
        </Link>
      ))}
    </div>
  );
};
