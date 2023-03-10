import { Montserrat } from "next/font/google";
import "../src/styles/index.css";

export const montserrat = Montserrat({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={montserrat.className}>
      <Component {...pageProps} />
    </main>
  );
}
