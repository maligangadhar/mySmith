import { IAppConfig } from '../app/models/viewModels';
import { resouceEndPoints, baseLocation } from './resourceEndPoints';

const gatewayEndPoint: string = 'https://om01opdev006.csyshcc043.co.uk';
export const environment: IAppConfig = {
  isProduction: false,
  adalConfig: {
    tenant: 'adfs',
    instance: 'https://sts006.csyshcc043.co.uk/',
    clientId: 'https://portal.corsys.com/',
    endpoints: resouceEndPoints,
    redirectUri: baseLocation
  },
  rolesUrl: gatewayEndPoint + '/roles',
  appsUrl: gatewayEndPoint + '/apps',
  casesUrl: gatewayEndPoint + '/cases',
  caseDetailUrl: gatewayEndPoint + '/casedetails',
  scansUrl: gatewayEndPoint + '/scan',
  userUrl: gatewayEndPoint + '/users',
  settingsMetadataUrl: gatewayEndPoint + '/platform/metadata',
  settingsMetadataCountryUrl: gatewayEndPoint + '/platform/metadata/countries',
  settingsUrl: gatewayEndPoint + '/settings/general',
  analysisUrl: gatewayEndPoint + '/analysis',
  attachmentUrl: gatewayEndPoint + '/files',
  opAdminUrl: gatewayEndPoint + '/opadmin/settings',
  deviceLicenseInfo: gatewayEndPoint + '/devices',
  locationsInfo: gatewayEndPoint + '/locations',
  auditUrl:gatewayEndPoint+'/users/logout',
  lineChartUrl: gatewayEndPoint + '/dashboard/profiler',
  operationDashboardKPI: gatewayEndPoint + '/dashboard/operational',
  historgramUrl: gatewayEndPoint + '/dashboard/operational/histogram',
};

