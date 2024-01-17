import "../css/PageContent.css"

interface PageProps {
  pageTitle: string;
  page: React.ReactNode;
}

const PageContent: React.FC<PageProps> = ({ pageTitle, page }) => (
  <div className="page-content" style={{"marginTop": '25px'}}>
    <h1>{ pageTitle }</h1>
    <hr />
    {page}
  </div>
);

export default PageContent;