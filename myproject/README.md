# How to setup kubectl for Kubernetes deployment
 
This is a one-time activity to have kubectl installed and configured in the respective environment

read about what is kubernetes here : https://kubernetes.io/

Available environment

- [x] $SUBDOMAIN - aplha.karmasoc.com


## Getting Started

The easiest way to get started is to clone the repository:

```
# Get the latest snapshot
git clone https://github.com/KarmaSoc/kubernetes-client.git myproject

# Change directory
cd myproject

# Execute Permission
chmod 777 Install-configure-kubectl.sh

# Run the Script
source Install-configure-kubectl.sh
```
## Available Options

               Karmasoc INC.

                 M A I N - M E N U

               1. Install and Configure Kubectl
               2. Configure Kubectl
               3. Install AWS Command line

               Enter your choice [1-3]


### Installing


Install kubectl (kubernetes client)

```
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/darwin/amd64/kubectl	
curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/darwin/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

Install AWS command line

```
curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
unzip awscli-bundle.zip
sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws
```


## Download kubeconfig for environment

Download kubeconfig for respective environment from AWS S3

```
mkdir ${HOME}/$SUBDOMAIN
aws s3 cp s3://karmasoc-kubernetes-kubeconfig/$SUBDOMAIN/kubeconfig ${HOME}/$SUBDOMAIN
```

### Export KUBECONFIG environment variable

```
export KUBECONFIG="${HOME}/$SUBDOMAIN/kubeconfig"
```

### Verify the installation

executing the  command
```
kubectl get pods
```
 will produce output as below

        NAME                                  READY     STATUS    RESTARTS   AGE
        karmasoc-business-1066279312-sgtk9    1/1       Running   0          4d
        karmasoc-emailer-3856605633-309hk     1/1       Running   0          1d
        karmasoc-feed-50142665-pwgh5          1/1       Running   0          10h
        karmasoc-posts-981278822-k9d91        1/1       Running   0          4d
        karmasoc-rabbitmq-3798370725-88xpb    1/1       Running   0          4d
        karmasoc-user-2664046327-ktg3c        1/1       Running   0          4d
        karmasoc-web-3803389155-2mvt9         1/1       Running   0          3d
        karmasoc-webserver-3989579063-pzstd   1/1       Running   0          4d

## FAQ
1. How to connect to kubernetes dashboard ?. 
    * execute
    
    ```
    kubectl proxy
    ```
    * open http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/overview?namespace=default in your browser
2. What is the kubernetes dashboard url to connect to kubernetes proxy :
    * `http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/overview?namespace=default`

3. How to interact with the shell inside the container?

    ```
    kubectl exec -it my-first-pod -- /bin/sh
    ```
4. How to query pods ?
    * get pod information from executing the below commands

    ```
    kubectl get pods -l run=karmasoc-web-3803389155-2mvt9 -o wide
    ```
    * run a busy box pod to query the above pod named karmasoc-web-3803389155-2mvt9

    ```
    kubectl run busybox --rm -it --image busybox
    ```

    * once connected query the pod pod

    ```
    Once connected, query the karmasoc-web-3803389155-2mvt9 pod.
    wget -qO - <POD1_IP>:8200
    wget -qO - <POD2_IP>:8200
    exit    
    ```


## kubectl command example

* [kubernetes-commands](https://s3.amazonaws.com/kubernetes-commands/nyc0817.coreostrain.me/exercises/index.html) - CoreOS

## Authors

* **Sasikumar Sugumar** - *Initial work* - [sasikumar-sugumar](https://github.com/sasikumar-sugumar)


