import { Component, OnInit } from '@angular/core';
import { Headers, Http, Response, URLSearchParams, QueryEncoder } from '@angular/http';
import { ActivatedRoute, Params }   from '@angular/router';
import { StatService } from './stat.service';
import * as _ from 'underscore';
import * as Chart from 'chart.js';
import * as $ from 'jquery';

import '../lib/bootstrap-datetimepicker';
import '../lib/bootstrap-datetimepicker.zh-CN';
import '../../assets/css/bootstrap-datetimepicker.css';
// require('../lib/bootstrap-datetimepicker');
// require('../lib/bootstrap-datetimepicker.zh-CN');
// require('../../assets/css/bootstrap-datetimepicker.css');

@Component({
    selector: 'stat',
    templateUrl: './stat.component.html',
})
export class StatComponent implements OnInit {
    public params: any = {};
    public starttime: string;
    public endtime: string;
    public max: Number = 100;
    public min: Number = 0;
    public step: Number = 100;
    public placeholder: boolean = false;
    public id: string;
    public type: string = 'temperature';

    public myChart: Chart;
    public myChart1: Chart;

    constructor( private http: Http, private service: StatService, private route: ActivatedRoute) {
    }
    
    public stat(type: string): void {
        this.type = type;
        $('.' + this.type).addClass('select').siblings().removeClass('select');

        if (this.myChart ) {
            this.myChart.clear();
        }
        if (this.myChart1) {
            this.myChart1.clear();
        }
        this.search();
    }

    public showdate(evt: any): void {
        console.log(evt);
        (<any> $(evt.srcElement)).datetimepicker('show');
    }

    public search(): void {
        let  that = this;
        this.type = this.type || 'temperature';
        if (!this.id) {
          return;
        } 

        let searchUrl = `name=${this.id}&type=${this.type}`;

        if (this.starttime) {
            searchUrl += '&starttime=' + this.starttime;
        }

        if (this.endtime) {
            searchUrl += '&endtime=' + this.endtime;
        }

        if (this.starttime) {
            searchUrl += '&starttime=' + this.starttime;
        }

        if (this.max) {
            searchUrl += '&max=' + this.max;
        }

        if (this.min) {
            searchUrl += '&min=' + this.min;
        }

        if (this.step) {
            searchUrl += '&step=' + this.step;
        }

        if (this.placeholder) {
            searchUrl += '&placeholder=' + this.placeholder;
        }
    
        this.service.get(searchUrl)
        .then( (res) => {
            let data = res.json();
            if (that.type === 'gas') {
                this.myChart = this.initChart(data['g145'], 'myChart');
                this.myChart1 = this.initChart(data['g146'], 'myChart1');
            } else {
                this.initChart(res.json(), 'myChart');
            }
        }).catch((err) => console.log(err.message || err));
    }
    
    public ngOnInit(): void {
        this.route.params.forEach( (param: Params) => {
            _.extend(this.params, param);
        });
        this.init();
        this.search();
    }

    private initChart(xdata: any, canvasId: string): Chart {
      console.log(xdata);
      let cvs = document.getElementById(canvasId) as HTMLCanvasElement;
      let ctx = cvs.getContext('2d');
      let params: any = new URLSearchParams(location.search.slice(1));
      let temperaturemode = params.get('temperaturemode');

      let ds = [{
          label: '# ' + this.type,
          pointRadius: 0,
          data: xdata.data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1,
          yAxisID: '1y'
      }];
      if (params.temperaturemode === '3') {
          if (xdata.data0) {
              ds.push({
                  label: '# temperature2',
                  pointRadius: 0,
                  data: xdata.data0 || [],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  yAxisID: '1y'
              });
          }
          if (xdata.data2) {
              ds.push({
                  label: '# temperature3',
                  pointRadius: 0,
                  data: xdata.data2 || [],
                  backgroundColor: 'rgba(255, 206, 86, 0.2)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1,
                  yAxisID: '2y'
              });
          }
      }
      if (this.type === 'gas') {
          if (xdata.data0) {
              ds.push({
                  label: '# flowrate',
                  pointRadius: 0,
                  data: xdata.data0 || [],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  yAxisID: '2y'
              });
          }
      }

      let config = {
        type: 'line',
        data: {
            labels: xdata.time,
            datasets: ds
        },
        options: {
            hover: {
                mode: 'label'
            },
            scales: {
                yAxes: [{
                    id: '1y',
                    type: 'linear',
                    position: 'left'
                }, {
                    id: '2y',
                    type: 'linear',
                    position: 'right',
                    // ticks: {
                    //     //设置y坐标的后缀
                    //     callback: function(value, index, values) {
                    //         return value;
                    //     }
                    // }
                }]
            }
        }
      };

      return new Chart(cvs.getContext('2d'), config);
    }

    private init(): void {
        console.log(this.params);
        this.id = this.params['id'];
        document.title = '统计';
        let params = new URLSearchParams(location.search.slice(1));
        (<any> $('#starttime,#endtime')).datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
            language: 'zh-CN',
            initialDate: new Date()
        });
        if (params) {
            this.type = params.get('type') || 'temperature';
            this.starttime = params.get('starttime');
            this.endtime = params.get('endtime');
            this.max = +params.get('max') || 100;
            this.min = +params.get('min') || 0;
            this.step = +params.get('step') || 100;
            this.placeholder = !!params.get('placeholder');
        }
        
        $('.' + this.type).addClass('select');
    }   
}
