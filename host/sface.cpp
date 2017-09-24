// Copyright (c) 2017 Andrea Vogrig
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

#include <algorithm>
#include <iostream>
#include <cstring>
#include <cstdlib>
#include <stdlib.h>
#include <string.h>
#include <vector>

#include "jsmn.h"

#include "osc/OscOutboundPacketStream.h"
#include "ip/UdpSocket.h"
#include "ip/IpEndpointName.h"

#define OUTPUT_BUFFER_SIZE 1024
#define RESPONSE_SIZE 256
#define RESPONSE_HEADER 4

#define MAX_TOKENS 128
#define MAX_STRING 50


static int jsoneq(const char *json, jsmntok_t *tok, const char *s) {
  if (tok->type == JSMN_STRING && (int) strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) {
    return 0;
  }
  return -1;
}


class any{
private:
    struct base {
        virtual ~base() {}
        virtual base* clone() const = 0;
    };
    template <typename T>
    struct data: base {
        data(T const& value): value_(value) {}
        data<T>* clone() const { return new data<T>(*this); }
        T value_;
    };
    base* ptr_;
public:
    template <typename T> any(T const& value): ptr_(new data<T>(value)) {}
    any(any const& other): ptr_(other.ptr_->clone()) {}
    any& operator= (any const& other) {
        any(other).swap(*this);
        return *this;
    }
    ~any() { delete this->ptr_; }
    void swap(any& other) { std::swap(this->ptr_, other.ptr_); }

    template <typename T>
    T& get() {
        return dynamic_cast<data<T>&>(*this->ptr_).value_;
    }
};


// oscpack
const char *hostName = "localhost";
int port = 57120;
osc::IpEndpointName host( hostName, port );
osc::UdpTransmitSocket transmitSocket(host);
char buffer[OUTPUT_BUFFER_SIZE];
osc::OutboundPacketStream p( buffer, OUTPUT_BUFFER_SIZE );


inline void send_string(const char * address,char * str){
    p.Clear();
    p << osc::BeginMessage( address );
    p << str << osc::EndMessage;
    transmitSocket.Send( p.Data(), p.Size() );//send osc message
}

template <typename T>
inline void send_message(const char * address,std::vector<any> params){
    p.Clear();
    p << osc::BeginMessage( address );
    for(int i=0;i<params.size();i++){
      try { 
        p << params[i].get<T>();      
      } catch (...){
        printf("Error: void send_message() wrong params type\n");
      }
    }
    p << osc::EndMessage;
    transmitSocket.Send( p.Data(), p.Size() );//send osc message
}

// The request and response messages are JSON with a 4 byte header (uint32)
// containing the length of the message: [length 4 byte header][message]
void readRequest(char *response){
  uint32_t length= 0;
  std::cin.read(reinterpret_cast<char*>(&length) ,RESPONSE_HEADER);//read 4 bytes header 
  std::cin.read(response,length);//read response
}
void writeResponse(char * data){
  uint32_t length = strlen(data);
  std::cout.write(reinterpret_cast<char*>(&length),RESPONSE_HEADER);//write 4 bytes header 
  std::cout<<data<<std::flush;//write response
}

int readJSON(char * JSON){
    int i;
    int r;
    jsmn_parser parser;
    jsmntok_t t[MAX_TOKENS]; /* We expect no more than MAX_TOKENS tokens */

    jsmn_init(&parser);
    r = jsmn_parse(&parser, JSON, strlen(JSON), t, sizeof(t)/sizeof(t[0]));
    if (r < 0) {
      printf("Failed to parse JSON: %d\n", r);
      return 1;
    }
 
    /* Loop over all keys of the root object */
    for (i = 1; i < r; i++) {
      if (jsoneq(JSON, &t[i], "id") == 0) { // osc address based on node "id";
        char address [MAX_STRING];
        sprintf (address, "/%.*s", t[i+1].end-t[i+1].start,JSON + t[i+1].start);
        //prepare osc message
        p.Clear();
        p << osc::BeginMessage( address );
        i++;
      } else if (jsoneq(JSON, &t[i], "int") == 0) {
        /* We may want to do strtol() here to get numeric value */
        char buffer [MAX_STRING];
        sprintf (buffer, "%.*s", t[i+1].end-t[i+1].start,JSON + t[i+1].start);
        int value = atoi(buffer);
        //printf("%f\n",value);
        p << (int)value;
        i++;
      } else if (jsoneq(JSON, &t[i], "float") == 0) {
        /* We may want to do strtol() here to get numeric value */
        char buffer [MAX_STRING];
        sprintf (buffer, "%.*s", t[i+1].end-t[i+1].start,JSON + t[i+1].start);
        float value = atof(buffer);
        //printf("%f\n",value);
        p << (float)value;
        i++;
      } else if (jsoneq(JSON, &t[i], "array") == 0) {
        int j;
        for (j = 0; j < t[i+1].size; j++) {
          jsmntok_t *g = &t[i+j+2];
          char buffer [MAX_STRING];
          sprintf (buffer, "%.*s",  g->end - g->start, JSON + g->start);
          float value = atof(buffer);
          p << (float)value;
        }
        i += t[i+1].size + 1;
      } else if (jsoneq(JSON, &t[i], "string") == 0) {
        /* We may use strndup() to fetch string value */
        char buffer [MAX_STRING];
        sprintf (buffer, "%.*s", t[i+1].end-t[i+1].start,JSON + t[i+1].start);
        p << buffer;
        i++;
      } else if (jsoneq(JSON, &t[i], "strings") == 0) {
        int j;
        for (j = 0; j < t[i+1].size; j++) {
          jsmntok_t *g = &t[i+j+2];
          char buffer [MAX_STRING];
          sprintf (buffer, "%.*s",  g->end - g->start, JSON + g->start);
          p << buffer;
        }
        i += t[i+1].size + 1;
      } else {
          //do nothing
      }
    }

    p << osc::EndMessage;
    transmitSocket.Send( p.Data(), p.Size() );//send osc message

    return 0;
}


int main(int argc, char* argv[]){
    (void) argc; // suppress unused parameter warnings
    (void) argv; // suppress unused parameter warnings

    std::cout.setf( std::ios_base::unitbuf ); //instead of "<< eof" and "flushall"

    char response[RESPONSE_SIZE];

    readRequest(response);//read request

    int r = readJSON(response);//parse json

    writeResponse(response);// write response

    return EXIT_SUCCESS;
   
}

