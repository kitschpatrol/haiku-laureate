CONTAINER_NAME=haiku.frontiernerds.com
IMAGE_NAME=ericmika/$CONTAINER_NAME
DOMAINS=haiku.frontiernerds.com,haiku.frontiernerds.net

cd $(dirname $0)
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker build -t $IMAGE_NAME .

# docker run -p "80:80" -i -t -e VIRTUAL_HOST=$DOMAINS -v ${PWD}/app:/home/app --name $CONTAINER_NAME $IMAGE_NAME
docker run --restart=always -i -t -d -e VIRTUAL_HOST=$DOMAINS -v ${PWD}/app:/home/app --name $CONTAINER_NAME $IMAGE_NAME
