import Landing from '~/src/Components/Landing';
import Plan from '~/src/Models/DBModels/Plan.js';
import { PlanBillingInterval } from '~/src/enums';

export default function Home(props) {
  return (
    <Landing {...props} />
  )
}

export async function getStaticProps({req}) {
  let plans = null;
  try {
      plans = await Plan.find({where: {available: true}, orderBy: {fieldName: 'price', direction: 'ASC'}});
  } catch (err) {
      console.log(err);
  }

  const jsonPlans = JSON.parse(JSON.stringify(plans));
  return {
      props: { plans: jsonPlans }
  }
}