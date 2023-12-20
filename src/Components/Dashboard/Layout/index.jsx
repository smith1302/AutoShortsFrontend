import classes from "./index.module.scss";
import clsx from "clsx";
import NavBar from "~/src/Components/Common/NavBar";
import Footer from "~/src/Components/Common/Footer";
import Sidebar from "./Sidebar";

import CircularProgress from '@mui/material/CircularProgress';

export default function Layout({ children, className, loading }) {

	return (
		<div className={clsx(className, classes.root)}>
			<NavBar fullWidth />
            <div className={classes.grid}>
                <div className={classes.left}>
                    <Sidebar />
                </div>
                <div className={classes.right}>
                    {loading ? (
                        <div className={classes.loadingContainer}><CircularProgress size={30} /></div>
                    ) : (
                        children
                    )}
                </div>
            </div>
			<Footer />
		</div>
	)
}