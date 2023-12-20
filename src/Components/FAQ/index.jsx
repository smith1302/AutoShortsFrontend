import BasicPage from '~/src/Components/Common/BasicPage';
import paths from '~/src/paths';
import classes from './index.module.scss'

export default function FAQ() {
    return (
        <BasicPage title="FAQ" heroSubtitle={<span>Can't find an answer? <a href={paths.contact} target="_blank">Reach out</a> to our support team.</span>} heroTitle="Frequently Asked Questions">
            <div className={classes.body}>
                <QABlock 
                    question="Is there a free trial?"
                    answer={<span>You bet your sweet bippy there is. Simply <a href={paths.register}>create a free account</a> and you can browse a limited number of products and stores. <b>No credit card required.</b></span>}
                />
                <QABlock 
                    question="How does store tracking work?"
                    answer={`In order to view a store's sales data, you must first "track" the store. This is done by clicking the "Track Store +" button on the store's page. If the store is already in our database, you will see sales data immediately. Otherwise, it will take 24 hours for our bots to gather the data.`}
                />
                <QABlock 
                    question="How accurate is the sales data?"
                    answer={`Unlike many other services that simply "guess" the sales data based on average conversion rates and website traffic, our platform is actually able to detect sales of a store's individual products. This means that our data is extremely accurate, generally within ~10% of the actual sales. There are some rare cases where a store can trick our system into thinking a product has sold when it hasn't, but this only happens on select stores.`}
                />
                <QABlock 
                    question="Is it easy to cancel?"
                    answer="Absolutely. We hate services that purposefully make it difficult to cancel. You can cancel at the click of a button from the dashboard's billing page."
                />
                <QABlock 
                    question="How does the membership work?"
                    answer="Beyond the free plan, we offer different tiers of memberships. The higher tier memberships allow you to track more stores, see a bigger list of top products, and more. You can view the different plans on the billing page. Each membership is billed on a monthly or annual basis."
                />
                <QABlock 
                    question="Can I get a refund?"
                    answer="Since we offer a free plan, we do not offer refunds for paid plans. However, you can cancel your membership at any time and you will not be billed again."
                />
                <QABlock 
                    question="How can I use this to help my business?"
                    answer="There are many ways to use this data to help your business. You can use it to find new products to sell, find new stores to partner with, or even spy on your competitors. By knowing exactly which products are being sold, you can make better decisions for your business."
                />
            </div>
        </BasicPage>
    );
}

function QABlock({question, answer}) {
    return (
        <div className={classes.qa}>
            <h3 className={classes.question}>{question}</h3>
            <div className={classes.answer}>
                {answer}
            </div>
        </div>
    )
}