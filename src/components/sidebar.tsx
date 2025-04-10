import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./worskpace-switcher";

const Sidebar = () => {
  return ( 
    <aside className="h-full bg-neutral-100 p-4 w-full">
      <Link href="/" className="p-4">
        <Image src="/logo.svg" alt="Logo" width={164} height={48}/>
      </Link>
      <DottedSeparator className="py-4"/>
      <WorkspaceSwitcher />
      <DottedSeparator className="py-4"/>
      <Navigation />
    </aside>
   );
}
 
export default Sidebar;