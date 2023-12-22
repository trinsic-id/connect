import {motion} from "framer-motion";
import {delay} from "lodash";
import {ReactNode, useContext, useEffect} from "react";

interface DemoPageProps {
    className?: string;
    children?: ReactNode;
    id: string;
    isPocketRides: boolean;
    isDesktop: boolean;
}

export const DemoPage = ({ className, children, id, isPocketRides, isDesktop }: DemoPageProps) => {
    useEffect(() => {
        delay(() => window.scroll(0, 0), 300);
    }, []);

    return (
        <motion.div
            id={id}
            //variants={getPageAnimations(appTransitionState)}
            //initial={isPreview ? "visible" : "hidden"}
            animate="visible"
            exit="exit"
            className={`flex h-full w-full place-content-center items-center ${ className ? className : ""}`}
        >
            <div
                className={`${isPocketRides ? "pocketrides-bg" : "pearbnb-bg"} ${
                    isDesktop ? "h-full w-full" : "lock-bg h-screen w-screen"
                } flex  flex-col place-content-center items-center bg-contain text-center`}
            >
                {children}
            </div>
        </motion.div>
    );
};
