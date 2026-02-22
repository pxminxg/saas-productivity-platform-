import { useEffect, useState } from "react";

export default function Toast({ toast, clearToast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(clearToast, 150);
    }, toast.duration ?? 2200);

    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast || !visible) return null;

  const cls = toast.type === "error" ? "toast toastErr" : "toast toastOk";

  return (
    <div className="toastWrap">
      <div className={cls}>
        <div className="toastRow">
          <div>
            <p className="toastTitle">
              {toast.title ?? (toast.type === "error" ? "Error" : "Success")}
            </p>
            <p className="toastBody">{toast.message}</p>
          </div>
          <button className="toastX" onClick={clearToast}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
