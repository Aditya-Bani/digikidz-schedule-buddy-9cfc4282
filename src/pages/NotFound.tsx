import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <div className="mx-auto w-fit p-6 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-7xl font-bold text-gray-900 dark:text-gray-100">404</h1>
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Halaman Tidak Ditemukan</p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
          </div>
        </div>
        
        <Button 
          asChild
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg"
        >
          <a href="/" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </a>
        </Button>
        
        <div className="pt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jika masalah berlanjut, hubungi administrator sistem
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;