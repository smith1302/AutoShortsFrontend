import Manage from '~/src/Components/Dashboard/Series/Manage';
import { useRouter } from 'next/router';

export default function SeriesManage() {
    const router = useRouter()
    return <Manage id={router.query.seriesID} />
}
