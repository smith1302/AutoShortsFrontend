import Button from '@mui/material/Button';
import classes from './index.module.scss';
import CircularProgress from '@mui/material/CircularProgress';
import clsx from 'clsx';

export default function CustomButton(props) {
    let {className, loading, disabled, small, ...otherProps} = props
    return (
        <Button disabled={loading || disabled} className={clsx(classes.root, props.className, small ? classes.small : null)} {...otherProps}>
            {loading ? <CircularProgress size={24} className={classes.progress} /> : props.children}
        </Button>
    );
}