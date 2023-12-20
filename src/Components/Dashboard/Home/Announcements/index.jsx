import classes from "./index.module.scss";
import clsx from "clsx";
import Paper from '@mui/material/Paper';
import PageHeading from "~/src/Components/Dashboard/PageHeading";

export default function DashboardPopularGoalCards({ children, className, announcements }) {
    if (!announcements || !announcements.length) {
        return null;
    }

	return (
		<section className={clsx(className, classes.root)}>
            <PageHeading title="Announcements" />
            <Paper className={classes.cardBG}>
                {announcements.map((announcement, index) => (
                    <AnnouncementItem 
                        date={announcement.created}
                        title={announcement.title}
                        description={announcement.description}
                        key={announcement.created}
                        />
                ))}
            </Paper>
        </section>
	)
}

function AnnouncementItem({date, title, description}) {
    return (
        <div className={classes.announcement}>
            <div className={classes.date}>{new Date(date).toDateString()}</div>
            <div className={classes.messageWrapper}>
                <div className={classes.title}>{title}</div>
                <div className={classes.description}>{description}</div>
            </div>
    </div>
    )
}