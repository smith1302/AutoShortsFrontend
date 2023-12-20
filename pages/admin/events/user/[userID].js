import UserEvents from '~/src/Components/Admin/UserEvents';


export default function UserEventsPage({userID}) {
    return <UserEvents userID={userID} />
}

UserEventsPage.getInitialProps = async ({ query }) => {
    return { userID: query?.userID }
}