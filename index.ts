import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import * as docker from '@pulumi/docker';

/** 
 *  !1. Enable necessary GCP API before begin (artifact registry, container registry, cloudrun)
 *  !2. Make sure you config gcloud project in your terminal before up stack
 *  $ pulumi config set gcp:project <projectname> 
    $ pulumi config set gcp:region <region>
 */

const location = gcp.config.region || 'asia-southeast1';

const enableCloudRun = new gcp.projects.Service('EnableCloudRun', {
  service: 'run.googleapis.com',
});

// Build Docker image
// Note: Run `gcloud auth configure-docker` in your command line to configure auth to GCR.
const imageName = 'nodejs-app';
const nodejsApiImage = new docker.Image(imageName, {
  imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:v1.0.0`,
  build: {
    context: './app',
  },
});

// Deploy to Cloud Run. Some extra parameters like concurrency and memory are set for illustration purpose.
const nodejsService = new gcp.cloudrun.Service('nodejs', {
  location,
  template: {
    spec: {
      containers: [
        {
          image: nodejsApiImage.imageName,
          resources: {
            limits: {
              memory: '1Gi',
            },
          },
        },
      ],
      containerConcurrency: 50,
    },
  },
});

const iamNodejs = new gcp.cloudrun.IamMember('nodejs-everyone', {
  service: nodejsService.name,
  location,
  role: 'roles/run.invoker',
  member: 'allUsers',
});

export const nodejsServiceUrl = nodejsService.statuses[0].url;
