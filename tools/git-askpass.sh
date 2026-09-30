#!/bin/sh
case "$1" in
  *sername*) printf '%s\n' "$RPG_SITE_GIT_USER" ;;
  *) printf '%s\n' "$RPG_SITE_GIT_TOKEN" ;;
esac
